# Dashboard Fixo - Documentação

## Visão Geral

O dashboard foi redesenhado com um **layout fixo e profissional**, removendo a funcionalidade de drag & drop para oferecer uma experiência mais consistente e focada.

## Estrutura do Layout

### 🎨 Design Principal

O dashboard está organizado em um grid de 12 colunas com dois painéis principais:

#### Coluna Esquerda (4 colunas - 33%)
1. **📊 Produtos gastos nos últimos 30 dias**
   - Tipo: Donut Chart
   - Altura: 450px
   - Mostra distribuição de produtos consumidos
   - Cores: Sistema de 5 cores (#ff2626, #5e5e5e, #d4d4d4, #ffa8a8, #1b1b1b)

2. **📅 Produtos Diários durante os últimos dias**
   - Tipo: Weekly Chart (Gráfico de Barras Semanal)
   - Altura: 450px
   - Navegação por semanas (◀ ▶)
   - Mostra: Dom, Seg, Ter, Qua, Qui, Sex, Sáb
   - Subtitle: "Mantendo padrão de semanas de calendários"

#### Coluna Direita (8 colunas - 67%)

**Linha 1: Cards de Métricas (4 cards)**
- 🔴 Total Geral (background: red gradient)
- 🔵 Fórmulas Únicas (background: blue gradient)
- 🟢 Dias Únicos (background: green gradient)
- 🟣 Média (background: purple gradient)
- Altura: Auto
- Cada card tem borda colorida de 2px e shadow-md

**Linha 2: Evolução Temporal**
- 📈 Gráfico de Linha
- Altura: 380px
- Seletor de período: 7 dias / 30 dias / 90 dias
- Mostra tendência temporal de produção

**Linha 3: Análise Personalizada**
- 🔍 Análise multi-modo
- Altura: 450px
- 3 Modos:
  - 🏆 Top 10 Fórmulas (barras horizontais)
  - 📊 Análise por Horário (produção por hora)
  - 📈 Distribuição por Faixa (0-100kg, 100-500kg, 500-1000kg, >1000kg)

## Estilização

### Cores e Temas

**Cards Principais:**
- Background: white
- Border: 2px solid gray-200
- Shadow: shadow-md
- Border radius: rounded-xl (12px)

**Headers:**
- Background: gradient from gray-50 to gray-100
- Border bottom: 2px solid gray-200
- Font: text-base font-bold
- Icons: Emojis nativos para visual clean

**Cards de Métricas:**
- Gradients coloridos com bordas matching
- Red: from-red-50 to-red-100, border-red-200
- Blue: from-blue-50 to-blue-100, border-blue-200
- Green: from-green-50 to-green-100, border-green-200
- Purple: from-purple-50 to-purple-100, border-purple-200

**Background Geral:**
- Gradient: from-gray-50 via-white to-gray-100
- Padding responsivo: p-4 md:p-6
- Max width: 1920px centralizado

### Painel de Filtros

**Design Premium:**
- Background header: gradient from-red-600 to-red-500
- Texto header: white com icon SVG
- Border: 2px solid red-700
- Shadow: shadow-lg
- Rounded: rounded-xl
- Content padding: p-5

## Responsividade

### Breakpoints

**Desktop (lg+):**
- Coluna esquerda: 4/12 colunas
- Coluna direita: 8/12 colunas
- Cards de métricas: 4 colunas

**Tablet (md):**
- Layout mantém proporções
- Cards de métricas: 2 linhas de 2

**Mobile (<md):**
- Todas colunas viram col-span-12 (100%)
- Cards empilham verticalmente
- Espaçamento reduzido

## Alterações do Código

### Arquivos Modificados

1. **`home.tsx`** - Simplificado drasticamente
   - ❌ Removido: DashboardBuilder, WidgetConfig, Layout, estados de drag & drop
   - ❌ Removido: Funções deprecadas de agregação local
   - ✅ Adicionado: FixedDashboard component
   - ✅ Melhorado: Estilização do painel de filtros

2. **`FixedDashboard.tsx`** - Novo componente criado
   - Layout em grid 12 colunas
   - 7 widgets posicionados fixamente
   - Estilização moderna e consistente
   - Props: rows, filters

3. **`WidgetContent.tsx`** - Mantido intacto
   - Todos 8 tipos de widgets funcionando
   - Hook useChartData conectando ao backend
   - Tooltips customizados
   - Loading states

### Arquivos Não Utilizados (podem ser removidos)

- `DashboardBuilder.tsx` - Não é mais usado
- `react-grid-layout` dependency - Não é mais necessária

## Widgets Implementados

### 1. donut-chart
- Gráfico de pizza
- Usa endpoint: `/api/chartdata/produtos`
- Tooltip com porcentagens

### 2. weekly-chart
- Gráfico de barras semanal
- Navegação ◀ ▶
- Agregação local por dia da semana
- Opcional: pode usar `/api/chartdata/semana`

### 3. stats-card
- Card de métrica única
- Usa endpoint: `/api/chartdata/stats`
- Mostra: totalGeral em kg

### 4. metric-card (3 variações)
- uniqueFormulas: Fórmulas únicas
- uniqueDays: Dias únicos
- average: Média de produção
- Usa endpoint: `/api/chartdata/stats`

### 5. line-chart
- Gráfico de tendência temporal
- Seletores: 7d, 30d, 90d
- Agregação local por dia

### 6. custom-analysis
- 3 modos de análise:
  - top10: Top 10 fórmulas
  - comparison: Análise por horário
  - distribution: Distribuição por faixa
- Agregação local

### 7. table
- Não implementado no layout fixo atual
- Pode ser adicionado conforme necessidade

## Endpoints do Backend

Todos os widgets consomem endpoints especializados:

```
GET /api/chartdata/formulas?[filtros]
GET /api/chartdata/produtos?[filtros]
GET /api/chartdata/horarios?[filtros]
GET /api/chartdata/diasSemana?[filtros]
GET /api/chartdata/stats?[filtros]
GET /api/chartdata/semana?weekStart=YYYY-MM-DD&[filtros]
```

**Filtros disponíveis:**
- formula
- dataInicio
- dataFim
- codigo
- numero

## Performance

### Otimizações

1. **Widgets usam backend direto** - Sem processamento pesado no frontend
2. **useEffect otimizados** - Dependências corretas
3. **useMemo para agregações locais** - Recalcula apenas quando necessário
4. **Loading states** - Feedback visual durante carregamento
5. **Empty states** - Mensagens quando não há dados

### Melhorias Futuras

- [ ] Implementar cache de dados no frontend
- [ ] Adicionar skeleton loaders
- [ ] Implementar virtual scrolling para tabelas grandes
- [ ] Lazy loading de widgets fora da viewport
- [ ] Service Worker para offline mode

## Manutenção

### Como Adicionar Novo Widget

1. Adicionar novo widget em `FixedDashboard.tsx`:
```tsx
<Card className="bg-white shadow-md border-2 border-gray-200 rounded-xl overflow-hidden h-[400px]">
  <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200 pb-3 pt-4 px-5">
    <CardTitle className="text-base font-bold text-gray-900">
      🆕 Novo Widget
    </CardTitle>
  </CardHeader>
  <CardContent className="p-4 h-[calc(100%-70px)]">
    <WidgetContent
      type="novo-tipo"
      rows={rows}
      config={{ filters }}
    />
  </CardContent>
</Card>
```

2. Implementar o tipo em `WidgetContent.tsx`
3. Criar endpoint backend se necessário

### Como Alterar Layout

**Modificar proporções das colunas:**
```tsx
// Esquerda de 4 para 3 colunas:
<div className="col-span-12 lg:col-span-3">

// Direita de 8 para 9 colunas:
<div className="col-span-12 lg:col-span-9">
```

**Alterar altura de widget:**
```tsx
// De h-[450px] para h-[500px]:
<Card className="... h-[500px]">
  <CardContent className="... h-[calc(100%-70px)]">
    {/* 70px = altura do header */}
```

## Compatibilidade

- ✅ React 18
- ✅ TypeScript 5
- ✅ Tailwind CSS 4
- ✅ Recharts 2.15.4
- ✅ Radix UI components
- ✅ Chrome, Firefox, Safari, Edge (últimas versões)
- ✅ Mobile responsive

## Conclusão

O novo layout fixo oferece:
- ✅ Experiência consistente
- ✅ Design moderno e profissional
- ✅ Performance otimizada
- ✅ Código mais simples e mantível
- ✅ Responsivo para todos dispositivos
- ✅ Foco nos dados essenciais

Aproveita, mano peppa! 🚀
