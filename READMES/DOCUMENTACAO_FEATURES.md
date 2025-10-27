# Cortez - Documentação Completa de Funcionalidades

## Índice
1. [Visão Geral](#visão-geral)
2. [Funcionalidades Frontend](#funcionalidades-frontend)
3. [Funcionalidades Backend](#funcionalidades-backend)
4. [Sistema de Conversão de Unidades](#sistema-de-conversão-de-unidades)
5. [Sistema de Cache](#sistema-de-cache)
6. [Fluxo de Dados](#fluxo-de-dados)

---

## Visão Geral

**Cortez** é um sistema de relatórios para automação industrial que processa dados CSV de IHMs (Interface Homem-Máquina), armazena em banco de dados e oferece visualizações interativas.

### Tecnologias
- **Frontend**: React + TypeScript + Vite + Electron
- **Backend**: Node.js + Express + TypeORM
- **Banco de Dados**: MySQL (produção) / SQLite (desenvolvimento)

---

## Funcionalidades Frontend

### 1. Tela de Relatórios (`report.tsx`)

#### 1.1 Paginação Inteligente
- **Função**: `useReportData(filtros, page, pageSize)`
- **Cache**: 10 minutos (alinhado com backend)
- **Otimizações**: 
  - Detecção de mudanças via checksum
  - Invalidação automática quando dados mudam
  - Feedback visual imediato na navegação

#### 1.2 Sistema de Filtros
```typescript
interface Filtros {
  dataInicio?: string;    // Formato: YYYY-MM-DD
  dataFim?: string;       // Formato: YYYY-MM-DD
  nomeFormula?: string;   // Nome ou código da fórmula
  codigo?: string;        // Form1 (código gerado pela IHM)
  numero?: string;        // Form2 (código do cliente)
  sortBy?: string;        // Coluna para ordenação
  sortDir?: 'ASC'|'DESC'; // Direção da ordenação
}
```

#### 1.3 Ordenação por Coluna
- **Função**: `handleToggleSort(coluna: string)`
- **Colunas Suportadas**: 
  - `Dia`, `Hora`, `Nome`, `Form1`, `Form2`
  - `Prod_1` até `Prod_40` (produtos dinâmicos)
- **Comportamento**:
  - Clique 1: Ordena DESC
  - Clique 2: Ordena ASC
  - Clique 3: Volta para ordenação padrão (Dia DESC)

#### 1.4 Visualizações de Gráficos
**Gráficos Disponíveis**:
- **Produtos (Donut)**: Consumo por produto
- **Fórmulas (Donut)**: Distribuição de fórmulas
- **Horários (Bar)**: Produção por hora do dia
- **Semanal (Bar)**: Produção por dia da semana

**Sistema de Hover**:
- Destaque visual ao passar mouse
- Sincronização entre gráfico e lista lateral
- Tooltip com informações detalhadas

#### 1.5 Gestão de Produtos
```typescript
interface ProdutoInfo {
  nome: string;      // Nome do produto
  unidade: 'g'|'kg'; // Unidade de medida
  num: number;       // Índice do produto (1-40)
}
```

**Conversão Automática**:
- Gramas (g): Valor ÷ 1000 = kg (para exibição)
- Quilos (kg): Valor sem conversão
- **Importante**: Banco de dados mantém valores originais

#### 1.6 Exportação de Dados
**Formatos**:
- **PDF**: Relatório completo com gráficos
- **Excel**: Dados tabulares com todas as colunas

**Opções de PDF**:
- Incluir/excluir comentários
- Incluir/excluir gráficos
- Logo customizada

### 2. Tela de Produtos (`products.tsx`)
- Edição de nomes de produtos
- Configuração de unidades (g/kg)
- Persistência automática no backend

### 3. Sistema de Toasts (`toastManager.ts`)

**Funções**:
```typescript
showLoading(key, message)      // Toast de carregamento
updateSuccess(key, message)    // Atualiza para sucesso
updateError(key, message)      // Atualiza para erro
showInfoOnce(key, message)     // Mostra apenas uma vez
showWarningOnce(key, message)  // Aviso único
dismiss(key)                   // Remove toast
```

**Limitações**:
- **Máximo**: 3 toasts simultâneos
- **Anti-duplicação**: Controle por chaves únicas
- **Auto-close**: 3-6 segundos conforme tipo

---

## Funcionalidades Backend

### 1. API de Relatórios

#### 1.1 Paginação (`/api/relatorio/paginate`)
**Métodos**: GET e POST

**Parâmetros**:
```typescript
{
  page: number;           // Página atual (padrão: 1)
  pageSize: number;       // Itens por página (padrão: 100)
  dataInicio?: string;    // Filtro de data inicial
  dataFim?: string;       // Filtro de data final
  formula?: string;       // Nome ou código da fórmula
  codigo?: number;        // Form1
  numero?: number;        // Form2
  sortBy?: string;        // Coluna para ordenação
  sortDir?: 'ASC'|'DESC'; // Direção
}
```

**Resposta**:
```typescript
{
  rows: Array<{
    Dia: string;
    Hora: string;
    Nome: string;
    Codigo: number;
    Numero: number;
    values: number[];  // Array de 40 produtos
  }>;
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  checksum: string;    // Para detecção de mudanças
}
```

**Cache**: 
- Duração: 10 minutos
- Invalidação: Automática ao detectar mudanças no DB
- Limpeza: A cada 5 minutos remove entradas expiradas

#### 1.2 Resumo (`/api/resumo`)
**Função**: Calcula estatísticas agregadas

**Resposta**:
```typescript
{
  totalPesos: number;              // Total em kg
  batitdasTotais: number;          // Total de registros
  periodoInicio: string;           // Data inicial
  periodoFim: string;              // Data final
  horaInicial: string;             // Hora da primeira batida
  horaFinal: string;               // Hora da última batida
  formulasUtilizadas: {
    [nome: string]: {
      numero: number;
      nome: string;
      quantidade: number;
      porcentagem: number;
      somatoriaTotal: number;
    }
  };
  usosPorProduto: {
    [produto: string]: {
      quantidade: number;
      label: string;
      unidade: string;
    }
  };
  firstDayRange: {
    date: string;
    firstTime: string;
    lastTime: string;
  };
  lastDayRange: {
    date: string;
    firstTime: string;
    lastTime: string;
  };
}
```

### 2. Sistema de Coleta (`Collector`)

**Endpoints**:
- `GET /api/collector/start` - Inicia coleta automática
- `GET /api/collector/stop` - Para coleta
- `GET /api/collector/status` - Status atual

**Funcionamento**:
1. Conecta via FTP à IHM
2. Busca novos arquivos CSV
3. Faz backup dos arquivos
4. Processa e salva no banco
5. Aguarda intervalo (padrão: 60s)
6. Repete ciclo

### 3. Conversão de CSV

**Formatos Suportados**:
- **Novo**: Datas YYYY-MM-DD
- **Legado**: Datas DD/MM/YY

**Endpoint**: `POST /api/file/upload`
- Aceita multipart/form-data
- Detecta formato automaticamente
- Converte e processa em uma única operação

### 4. Gestão de Matéria-Prima

**Endpoint**: `POST /api/db/setupMateriaPrima`

**Payload**:
```json
{
  "items": [
    {
      "num": 1,
      "produto": "Produto A",
      "medida": 0  // 0=gramas, 1=quilos
    }
  ]
}
```

**Comportamento**:
- Cria ou atualiza produtos
- Valida dados de entrada
- Evita duplicação por `num`

---

## Sistema de Conversão de Unidades

### Fluxo Completo

#### 1. Banco de Dados
```sql
-- Materia Prima
CREATE TABLE materia_prima (
  num INT PRIMARY KEY,
  produto VARCHAR(255),
  medida INT  -- 0=gramas, 1=quilos
);

-- Relatório (valores SEMPRE no formato original)
CREATE TABLE relatorio (
  -- ... outras colunas
  Prod_1 DECIMAL(10,3),  -- Valor original (g ou kg)
  Prod_2 DECIMAL(10,3),
  -- ... até Prod_40
);
```

#### 2. Backend - Conversão na Leitura

**resumoService.ts**:
```typescript
// Ao calcular resumo
for (const row of allRows) {
  for (let i = 1; i <= 40; i++) {
    const valorOriginal = row[`Prod_${i}`];
    const materia = materiasPrimas.find(m => m.num === i);
    
    // Conversão para kg (normalização)
    const valorKg = materia?.medida === 0 
      ? valorOriginal / 1000  // gramas → kg
      : valorOriginal;        // já em kg
    
    totalPesos += valorKg;
  }
}
```

#### 3. Frontend - Exibição

**report.tsx**:
```typescript
// Ao exibir produtos
const displayProducts = useMemo(() => {
  return resumo.usosPorProduto.map(produto => {
    const unidade = produtosInfo[produto.id]?.unidade || 'kg';
    const valor = unidade === 'g' 
      ? produto.quantidade / 1000  // Para exibição em kg
      : produto.quantidade;
    
    return {
      nome: produto.nome,
      quantidade: valor,
      unidade: 'kg'  // Sempre exibe em kg
    };
  });
}, [resumo, produtosInfo]);
```

### Regras de Negócio

1. **Armazenamento**: Valores originais no banco
2. **Processamento**: Conversão para kg durante cálculos
3. **Exibição**: Sempre em kg para o usuário
4. **Configuração**: Editável em "Produtos"

---

## Sistema de Cache

### Frontend (`useReportData`)

**Estratégia**:
- Cache local por filtros
- TTL: 10 minutos
- Invalidação por checksum

**Implementação**:
```typescript
const cacheKey = JSON.stringify(filtros);
const cached = cache.get(cacheKey);

if (cached && cached.timestamp + TTL > now) {
  return cached.data;
}

const newData = await fetchData();
cache.set(cacheKey, { data: newData, timestamp: now });
```

### Backend (`relatorioPaginateCache`)

**Estrutura**:
```typescript
{
  [cacheKey: string]: {
    data: any;
    timestamp: number;
    expiresAt: number;
    dataChecksum: string;
  }
}
```

**Otimizações**:
- Limpeza automática de entradas expiradas
- Limite de 100 entradas
- Detecção inteligente de mudanças via checksum
- Headers HTTP para cache do navegador

**Endpoints de Gestão**:
- `GET /api/cache/paginate/status` - Status do cache
- `POST /api/cache/paginate/clear` - Limpa todo cache
- `POST /api/cache/paginate/clear-filter` - Limpa filtro específico

---

## Fluxo de Dados

### 1. Coleta Automática
```
IHM (FTP) → Collector → Backup → Parser → FileProcessor → DB
```

### 2. Upload Manual
```
Usuario → Upload Form → Backend → Parser → DB → Frontend
```

### 3. Visualização
```
Frontend → API Request → Cache Check → DB Query → Response → UI
```

### 4. Exportação
```
UI → Export Request → Backend → Generate File → Download
```

---

## Performance

### Otimizações Implementadas

1. **Paginação**: Apenas 100 registros por vez
2. **Cache**: Múltiplas camadas (frontend + backend)
3. **Índices DB**: Em colunas de filtro (Dia, Form1, Form2)
4. **Compressão**: Gzip para respostas HTTP >1KB
5. **Memoização**: React.memo e useMemo para componentes
6. **Conversão Lazy**: Apenas quando necessário
7. **Checksum**: Detecção rápida de mudanças sem queries pesadas

### Métricas Típicas

- **Paginação**: ~50-200ms
- **Resumo**: ~100-500ms
- **Upload CSV**: ~1-5s (1000 linhas)
- **Export Excel**: ~2-10s
- **Cache Hit**: ~5-10ms

---

## Troubleshooting

### Problema: Valores errados em produtos
**Causa**: Unidade incorreta configurada
**Solução**: Verificar `medida` em `materia_prima`

### Problema: Cache desatualizado
**Causa**: Checksum não detectou mudança
**Solução**: `POST /api/cache/paginate/clear`

### Problema: Gráficos vazios
**Causa**: Filtros muito restritivos
**Solução**: Ampliar período ou remover filtros

### Problema: Ordenação não funciona
**Causa**: Coluna inválida
**Solução**: Verificar se coluna está na lista de permitidas

---

## Próximas Melhorias

1. ✅ Sistema de logs de estatísticas
2. ✅ Toast manager otimizado (max 3, sem duplicatas)
3. ✅ Ordenação instantânea por coluna
4. ✅ Conversão g/kg integrada em todos os cálculos
5. ✅ Verificação de charts de horários

---

## Contato e Suporte

Para dúvidas ou suporte técnico:
- Email: suporte@jcortica.com.br
- Documentação: Disponível neste repositório

**Versão**: 2.0 (Cortez)
**Data**: 2025
