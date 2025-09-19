import React, { useState, useEffect } from 'react';
import { useEstoque, EstoqueItem, MovimentacaoEstoqueItem } from './hooks/useEstoque';
import { useMateriaPrima } from './hooks/useMateriaPrima';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from './components/ui/table';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './components/ui/card';
import { Badge } from './components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';
import { Textarea } from './components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from './components/ui/alert';
import { AlertCircle, AlertTriangle, ArrowDownCircle, ArrowUpCircle, Settings } from 'lucide-react';

// Formato de data para exibição
const formatarData = (dataStr: string) => {
  const data = new Date(dataStr);
  return data.toLocaleString('pt-BR');
};

// Formatar número com casas decimais
const formatarNumero = (valor: number) => {
  return valor.toLocaleString('pt-BR', { minimumFractionDigits: 3, maximumFractionDigits: 3 });
};

// Ícone para tipo de movimentação
const IconeMovimentacao = ({ tipo }: { tipo: string }) => {
  switch (tipo) {
    case 'entrada':
      return <ArrowUpCircle className="h-5 w-5 text-green-500" />;
    case 'saida':
      return <ArrowDownCircle className="h-5 w-5 text-red-500" />;
    case 'ajuste':
      return <Settings className="h-5 w-5 text-blue-500" />;
    case 'inventario':
      return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    default:
      return null;
  }
};

// Componente para movimentações de estoque
const MovimentacoesEstoque = () => {
  const { movimentacoes, carregarMovimentacoes, loading } = useEstoque();
  const { materias } = useMateriaPrima();
  const [filtros, setFiltros] = useState({
    materiaPrimaId: '',
    tipo: '',
    dataInicial: '',
    dataFinal: ''
  });

  const aplicarFiltros = () => {
    carregarMovimentacoes(
      filtros.materiaPrimaId || undefined,
      filtros.tipo as any || undefined,
      filtros.dataInicial || undefined,
      filtros.dataFinal || undefined
    );
  };

  useEffect(() => {
    carregarMovimentacoes();
  }, [carregarMovimentacoes]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Histórico de Movimentações</CardTitle>
        <CardDescription>Registro de entradas, saídas e ajustes no estoque</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-4 mb-4">
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="materiaPrima">Matéria-Prima</Label>
            <Select 
              value={filtros.materiaPrimaId} 
              onValueChange={(value) => setFiltros({...filtros, materiaPrimaId: value})}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Todas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas</SelectItem>
                {materias.map((mp) => (
                  <SelectItem key={mp.id} value={mp.id}>
                    {mp.produto}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="tipo">Tipo</Label>
            <Select 
              value={filtros.tipo} 
              onValueChange={(value) => setFiltros({...filtros, tipo: value})}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos</SelectItem>
                <SelectItem value="entrada">Entrada</SelectItem>
                <SelectItem value="saida">Saída</SelectItem>
                <SelectItem value="ajuste">Ajuste</SelectItem>
                <SelectItem value="inventario">Inventário</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="dataInicial">Data Inicial</Label>
            <Input 
              type="date" 
              id="dataInicial" 
              value={filtros.dataInicial} 
              onChange={(e) => setFiltros({...filtros, dataInicial: e.target.value})}
            />
          </div>
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="dataFinal">Data Final</Label>
            <Input 
              type="date" 
              id="dataFinal" 
              value={filtros.dataFinal} 
              onChange={(e) => setFiltros({...filtros, dataFinal: e.target.value})}
            />
          </div>
          <div className="flex items-end">
            <Button onClick={aplicarFiltros} disabled={loading}>
              {loading ? 'Carregando...' : 'Filtrar'}
            </Button>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Produto</TableHead>
              <TableHead className="text-right">Quantidade</TableHead>
              <TableHead className="text-right">Antes</TableHead>
              <TableHead className="text-right">Depois</TableHead>
              <TableHead>Responsável</TableHead>
              <TableHead>Observações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {movimentacoes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-6 text-muted-foreground">
                  Nenhuma movimentação encontrada
                </TableCell>
              </TableRow>
            ) : (
              movimentacoes.map((mov) => (
                <TableRow key={mov.id}>
                  <TableCell>{formatarData(mov.data_movimentacao)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <IconeMovimentacao tipo={mov.tipo} />
                      <span className="capitalize">{mov.tipo}</span>
                    </div>
                  </TableCell>
                  <TableCell>{mov.materiaPrima.produto}</TableCell>
                  <TableCell className="text-right font-medium">
                    {formatarNumero(mov.quantidade)} {mov.unidade}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatarNumero(mov.quantidade_anterior)} {mov.unidade}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatarNumero(mov.quantidade_atual)} {mov.unidade}
                  </TableCell>
                  <TableCell>{mov.responsavel || '-'}</TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {mov.observacoes || '-'}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

// Componente para adição de estoque
const AdicionarEstoqueDialog = ({ 
  materiaPrimaId, 
  onComplete 
}: { 
  materiaPrimaId: string, 
  onComplete: () => void 
}) => {
  const { adicionarEstoque } = useEstoque();
  const { materias } = useMateriaPrima();
  const [open, setOpen] = useState(false);
  const [formState, setFormState] = useState({
    quantidade: 0,
    observacoes: '',
    responsavel: '',
    documentoReferencia: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const materiaPrima = materias.find(mp => mp.id === materiaPrimaId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      await adicionarEstoque(
        materiaPrimaId,
        formState.quantidade,
        formState.observacoes,
        formState.responsavel,
        formState.documentoReferencia
      );
      
      setOpen(false);
      onComplete();
      
      // Resetar formulário
      setFormState({
        quantidade: 0,
        observacoes: '',
        responsavel: '',
        documentoReferencia: ''
      });
    } catch (err: any) {
      setError(err.message || 'Erro ao adicionar estoque');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-1">
          <ArrowUpCircle className="h-4 w-4" /> Entrada
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Adicionar Estoque</DialogTitle>
          <DialogDescription>
            Adicione quantidade ao estoque de {materiaPrima?.produto || 'produto'}.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive" className="mt-2">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erro</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantidade">Quantidade (kg)</Label>
              <Input
                id="quantidade"
                type="number"
                step="0.001"
                min="0.001"
                required
                value={formState.quantidade || ''}
                onChange={e => setFormState({...formState, quantidade: parseFloat(e.target.value) || 0})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="responsavel">Responsável</Label>
              <Input
                id="responsavel"
                value={formState.responsavel}
                onChange={e => setFormState({...formState, responsavel: e.target.value})}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="documentoReferencia">Documento de Referência</Label>
            <Input
              id="documentoReferencia"
              placeholder="Nota Fiscal, Lote, etc."
              value={formState.documentoReferencia}
              onChange={e => setFormState({...formState, documentoReferencia: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={formState.observacoes}
              onChange={e => setFormState({...formState, observacoes: e.target.value})}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || formState.quantidade <= 0}>
              {loading ? 'Salvando...' : 'Adicionar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Componente para remoção de estoque
const RemoverEstoqueDialog = ({ 
  materiaPrimaId, 
  estoqueAtual,
  onComplete 
}: { 
  materiaPrimaId: string, 
  estoqueAtual: number,
  onComplete: () => void 
}) => {
  const { removerEstoque } = useEstoque();
  const { materias } = useMateriaPrima();
  const [open, setOpen] = useState(false);
  const [formState, setFormState] = useState({
    quantidade: 0,
    observacoes: '',
    responsavel: '',
    documentoReferencia: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const materiaPrima = materias.find(mp => mp.id === materiaPrimaId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      await removerEstoque(
        materiaPrimaId,
        formState.quantidade,
        formState.observacoes,
        formState.responsavel,
        formState.documentoReferencia
      );
      
      setOpen(false);
      onComplete();
      
      // Resetar formulário
      setFormState({
        quantidade: 0,
        observacoes: '',
        responsavel: '',
        documentoReferencia: ''
      });
    } catch (err: any) {
      setError(err.message || 'Erro ao remover estoque');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-1">
          <ArrowDownCircle className="h-4 w-4" /> Saída
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Remover Estoque</DialogTitle>
          <DialogDescription>
            Remova quantidade do estoque de {materiaPrima?.produto || 'produto'}.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive" className="mt-2">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erro</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="bg-muted p-3 rounded-md flex items-center gap-2 my-2">
          <AlertTriangle className="h-4 w-4 text-yellow-500" />
          <span>Estoque atual: <strong>{formatarNumero(estoqueAtual)} kg</strong></span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantidade">Quantidade (kg)</Label>
              <Input
                id="quantidade"
                type="number"
                step="0.001"
                min="0.001"
                max={estoqueAtual}
                required
                value={formState.quantidade || ''}
                onChange={e => setFormState({...formState, quantidade: parseFloat(e.target.value) || 0})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="responsavel">Responsável</Label>
              <Input
                id="responsavel"
                value={formState.responsavel}
                onChange={e => setFormState({...formState, responsavel: e.target.value})}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="documentoReferencia">Documento de Referência</Label>
            <Input
              id="documentoReferencia"
              placeholder="Ordem de Produção, etc."
              value={formState.documentoReferencia}
              onChange={e => setFormState({...formState, documentoReferencia: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={formState.observacoes}
              onChange={e => setFormState({...formState, observacoes: e.target.value})}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || formState.quantidade <= 0 || formState.quantidade > estoqueAtual}>
              {loading ? 'Salvando...' : 'Remover'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Componente para ajuste de limites de estoque
const AjustarLimitesDialog = ({ 
  materiaPrimaId,
  estoqueItem, 
  onComplete 
}: { 
  materiaPrimaId: string,
  estoqueItem: EstoqueItem,
  onComplete: () => void 
}) => {
  const { atualizarLimites } = useEstoque();
  const { materias } = useMateriaPrima();
  const [open, setOpen] = useState(false);
  const [formState, setFormState] = useState({
    minimo: estoqueItem.quantidade_minima,
    maximo: estoqueItem.quantidade_maxima
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const materiaPrima = materias.find(mp => mp.id === materiaPrimaId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      await atualizarLimites(
        materiaPrimaId,
        formState.minimo,
        formState.maximo
      );
      
      setOpen(false);
      onComplete();
    } catch (err: any) {
      setError(err.message || 'Erro ao atualizar limites');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-1">
          <Settings className="h-4 w-4" /> Limites
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Ajustar Limites de Estoque</DialogTitle>
          <DialogDescription>
            Configure os limites mínimo e máximo para {materiaPrima?.produto || 'produto'}.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive" className="mt-2">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erro</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="minimo">Estoque Mínimo (kg)</Label>
              <Input
                id="minimo"
                type="number"
                step="0.001"
                min="0"
                required
                value={formState.minimo || ''}
                onChange={e => setFormState({...formState, minimo: parseFloat(e.target.value) || 0})}
              />
              <p className="text-xs text-muted-foreground">
                Quantidade mínima recomendada
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="maximo">Estoque Máximo (kg)</Label>
              <Input
                id="maximo"
                type="number"
                step="0.001"
                min={formState.minimo}
                required
                value={formState.maximo || ''}
                onChange={e => setFormState({...formState, maximo: parseFloat(e.target.value) || 0})}
              />
              <p className="text-xs text-muted-foreground">
                Capacidade máxima de armazenamento
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={loading || formState.maximo < formState.minimo}
            >
              {loading ? 'Salvando...' : 'Atualizar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Componente para ajuste de inventário
const AjustarInventarioDialog = ({ 
  materiaPrimaId,
  estoqueAtual, 
  onComplete 
}: { 
  materiaPrimaId: string,
  estoqueAtual: number,
  onComplete: () => void 
}) => {
  const { ajustarEstoque } = useEstoque();
  const { materias } = useMateriaPrima();
  const [open, setOpen] = useState(false);
  const [formState, setFormState] = useState({
    quantidade: estoqueAtual,
    observacoes: '',
    responsavel: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const materiaPrima = materias.find(mp => mp.id === materiaPrimaId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      await ajustarEstoque(
        materiaPrimaId,
        formState.quantidade,
        formState.observacoes,
        formState.responsavel
      );
      
      setOpen(false);
      onComplete();
      
      // Resetar formulário
      setFormState({
        quantidade: 0,
        observacoes: '',
        responsavel: ''
      });
    } catch (err: any) {
      setError(err.message || 'Erro ao ajustar inventário');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-1">
          <AlertCircle className="h-4 w-4" /> Inventário
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Ajuste de Inventário</DialogTitle>
          <DialogDescription>
            Ajuste o estoque real de {materiaPrima?.produto || 'produto'} após contagem física.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive" className="mt-2">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erro</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="bg-muted p-3 rounded-md flex items-center gap-2 my-2">
          <AlertTriangle className="h-4 w-4 text-yellow-500" />
          <span>Estoque atual no sistema: <strong>{formatarNumero(estoqueAtual)} kg</strong></span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantidade">Quantidade Real (kg)</Label>
              <Input
                id="quantidade"
                type="number"
                step="0.001"
                min="0"
                required
                value={formState.quantidade || ''}
                onChange={e => setFormState({...formState, quantidade: parseFloat(e.target.value) || 0})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="responsavel">Responsável</Label>
              <Input
                id="responsavel"
                value={formState.responsavel}
                onChange={e => setFormState({...formState, responsavel: e.target.value})}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              placeholder="Motivo do ajuste, contagem física, etc."
              value={formState.observacoes}
              onChange={e => setFormState({...formState, observacoes: e.target.value})}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Ajustar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Componente principal de Estoque
export default function Estoque() {
  const { 
    estoque, 
    estoqueBaixo,
    loading, 
    error,
    carregarEstoque, 
    carregarEstoqueBaixo 
  } = useEstoque();

  const { materias } = useMateriaPrima();
  const [activeTab, setActiveTab] = useState('geral');

  useEffect(() => {
    carregarEstoque();
    carregarEstoqueBaixo();
  }, [carregarEstoque, carregarEstoqueBaixo]);

  // Agrupar estoque por categoria
  const estoquePorCategoria: Record<string, EstoqueItem[]> = {};
  
  estoque.forEach(item => {
    const categoria = item.materiaPrima?.categoria || 'Sem categoria';
    if (!estoquePorCategoria[categoria]) {
      estoquePorCategoria[categoria] = [];
    }
    estoquePorCategoria[categoria].push(item);
  });

  const categorias = Object.keys(estoquePorCategoria).sort();

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Gestão de Estoque</h1>
      </div>
      
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="geral">Estoque Geral</TabsTrigger>
          <TabsTrigger value="baixo">Estoque Baixo</TabsTrigger>
          <TabsTrigger value="movimentacoes">Movimentações</TabsTrigger>
          <TabsTrigger value="categorias">Por Categoria</TabsTrigger>
        </TabsList>
        
        {/* Tab: Estoque Geral */}
        <TabsContent value="geral">
          <Card>
            <CardHeader>
              <CardTitle>Estoque Atual</CardTitle>
              <CardDescription>Visão geral do estoque de todos os produtos</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center py-10">
                  <p>Carregando...</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produto</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead className="text-right">Estoque Atual</TableHead>
                      <TableHead className="text-right">Mínimo</TableHead>
                      <TableHead className="text-right">Máximo</TableHead>
                      <TableHead className="text-right">Status</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {estoque.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                          Nenhum item em estoque
                        </TableCell>
                      </TableRow>
                    ) : (
                      estoque.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.materiaPrima.produto}</TableCell>
                          <TableCell>{item.materiaPrima.categoria || 'Sem categoria'}</TableCell>
                          <TableCell className="text-right font-semibold">
                            {formatarNumero(item.quantidade)} {item.unidade}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatarNumero(item.quantidade_minima)} {item.unidade}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatarNumero(item.quantidade_maxima)} {item.unidade}
                          </TableCell>
                          <TableCell className="text-right">
                            {item.quantidade <= item.quantidade_minima ? (
                              <Badge variant="destructive">Baixo</Badge>
                            ) : item.quantidade >= item.quantidade_maxima ? (
                              <Badge variant="default">Máximo</Badge>
                            ) : (
                              <Badge variant="secondary">Normal</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <AdicionarEstoqueDialog 
                                materiaPrimaId={item.materia_prima_id} 
                                onComplete={carregarEstoque} 
                              />
                              <RemoverEstoqueDialog 
                                materiaPrimaId={item.materia_prima_id} 
                                estoqueAtual={item.quantidade}
                                onComplete={carregarEstoque} 
                              />
                              <AjustarLimitesDialog 
                                materiaPrimaId={item.materia_prima_id} 
                                estoqueItem={item}
                                onComplete={carregarEstoque} 
                              />
                              <AjustarInventarioDialog 
                                materiaPrimaId={item.materia_prima_id}
                                estoqueAtual={item.quantidade}
                                onComplete={carregarEstoque}
                              />
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <p className="text-sm text-muted-foreground">
                Total de itens: {estoque.length}
              </p>
              <Button variant="outline" onClick={() => carregarEstoque()} disabled={loading}>
                Atualizar
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Tab: Estoque Baixo */}
        <TabsContent value="baixo">
          <Card>
            <CardHeader>
              <CardTitle>Estoque Baixo</CardTitle>
              <CardDescription>Produtos com estoque abaixo do mínimo</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center py-10">
                  <p>Carregando...</p>
                </div>
              ) : estoqueBaixo.length === 0 ? (
                <Alert className="mb-6">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Tudo em ordem</AlertTitle>
                  <AlertDescription>
                    Não há produtos com estoque abaixo do mínimo.
                  </AlertDescription>
                </Alert>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produto</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead className="text-right">Estoque Atual</TableHead>
                      <TableHead className="text-right">Mínimo</TableHead>
                      <TableHead className="text-right">Diferença</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {estoqueBaixo.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.materiaPrima.produto}</TableCell>
                        <TableCell>{item.materiaPrima.categoria || 'Sem categoria'}</TableCell>
                        <TableCell className="text-right font-semibold text-red-500">
                          {formatarNumero(item.quantidade)} {item.unidade}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatarNumero(item.quantidade_minima)} {item.unidade}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatarNumero(item.quantidade_minima - item.quantidade)} {item.unidade}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <AdicionarEstoqueDialog 
                              materiaPrimaId={item.materia_prima_id} 
                              onComplete={() => {
                                carregarEstoque();
                                carregarEstoqueBaixo();
                              }} 
                            />
                            <AjustarLimitesDialog 
                              materiaPrimaId={item.materia_prima_id} 
                              estoqueItem={item}
                              onComplete={() => {
                                carregarEstoque();
                                carregarEstoqueBaixo();
                              }} 
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <p className="text-sm text-muted-foreground">
                Itens com estoque crítico: {estoqueBaixo.length}
              </p>
              <Button variant="outline" onClick={() => carregarEstoqueBaixo()} disabled={loading}>
                Atualizar
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Tab: Movimentações */}
        <TabsContent value="movimentacoes">
          <MovimentacoesEstoque />
        </TabsContent>
        
        {/* Tab: Por Categoria */}
        <TabsContent value="categorias">
          <Card>
            <CardHeader>
              <CardTitle>Estoque por Categoria</CardTitle>
              <CardDescription>Visualização de estoque agrupado por categoria</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {loading ? (
                <div className="flex justify-center items-center py-10">
                  <p>Carregando...</p>
                </div>
              ) : categorias.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  Nenhum item em estoque
                </div>
              ) : (
                categorias.map((categoria) => (
                  <div key={categoria} className="space-y-3">
                    <h3 className="text-lg font-semibold">{categoria}</h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Produto</TableHead>
                          <TableHead className="text-right">Estoque Atual</TableHead>
                          <TableHead className="text-right">Mínimo</TableHead>
                          <TableHead className="text-right">Status</TableHead>
                          <TableHead>Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {estoquePorCategoria[categoria].map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium">{item.materiaPrima.produto}</TableCell>
                            <TableCell className="text-right font-semibold">
                              {formatarNumero(item.quantidade)} {item.unidade}
                            </TableCell>
                            <TableCell className="text-right">
                              {formatarNumero(item.quantidade_minima)} {item.unidade}
                            </TableCell>
                            <TableCell className="text-right">
                              {item.quantidade <= item.quantidade_minima ? (
                                <Badge variant="destructive">Baixo</Badge>
                              ) : item.quantidade >= item.quantidade_maxima ? (
                                <Badge variant="default">Máximo</Badge>
                              ) : (
                                <Badge variant="secondary">Normal</Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                <AdicionarEstoqueDialog 
                                  materiaPrimaId={item.materia_prima_id} 
                                  onComplete={carregarEstoque} 
                                />
                                <RemoverEstoqueDialog 
                                  materiaPrimaId={item.materia_prima_id} 
                                  estoqueAtual={item.quantidade}
                                  onComplete={carregarEstoque} 
                                />
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ))
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <p className="text-sm text-muted-foreground">
                Total de categorias: {categorias.length}
              </p>
              <Button variant="outline" onClick={() => carregarEstoque()} disabled={loading}>
                Atualizar
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}