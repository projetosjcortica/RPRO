# 📊 Documentação dos Widgets do Dashboard

## Widgets Disponíveis

### 1. 🍩 Gráfico Donut
**Tipo:** `donut-chart`  
**Tamanho padrão:** 4×4 colunas  
**Descrição:** Visualização em pizza com proporções

**Funcionalidades:**
- Seletor de tipo de dados (Fórmulas / Produtos / Horários / Dias da Semana)
- Tooltip interativo com nome, valor, porcentagem e total
- Cores diferenciadas por categoria
- Integração com endpoint `/api/chartdata/{tipo}`

**Quando usar:** Ideal para visualizar proporções e distribuições de categorias.

---

### 2. 📊 Gráfico de Barras
**Tipo:** `bar-chart`  
**Tamanho padrão:** 6×4 colunas  
**Descrição:** Comparação visual de valores

**Funcionalidades:**
- Seletor de tipo de dados (Fórmulas / Produtos / Horários / Dias da Semana)
- Tooltip com detalhes (nome, valor, contagem, média)
- Indicador de pico (horário ou dia de maior produção)
- Eixo X rotacionado para melhor visualização de labels

**Quando usar:** Para comparar valores entre diferentes categorias ou períodos.

---

### 3. 📅 Gráfico Semanal
**Tipo:** `weekly-chart`  
**Tamanho padrão:** 5×4 colunas  
**Descrição:** Navegue por semanas específicas

**Funcionalidades:**
- **Navegação semanal:** Botões ◀ e ▶ para avançar/voltar semanas
- **Visualização por dia:** Dom, Seg, Ter, Qua, Qui, Sex, Sáb
- **Indicador de período:** Mostra o range da semana (DD/MM → DD/MM)
- **Agregação local:** Calcula totais diretamente dos dados filtrados
- Integração futura com endpoint `/api/chartdata/semana`

**Quando usar:** Para análise de padrões semanais e comparação entre dias da semana.

**Exemplo de uso:**
```typescript
// Widget se auto-ajusta ao primeiro domingo da semana atual
// Navegação permite visualizar semanas passadas e futuras
```

---

### 4. 📈 Total Geral
**Tipo:** `stats-card`  
**Tamanho padrão:** 3×2 colunas  
**Descrição:** Soma total e contagem de registros

**Funcionalidades:**
- Soma total de todos os valores em kg
- Contagem de registros
- Número de dias únicos
- Indicador de loading
- Integração com endpoint `/api/chartdata/stats`

**Quando usar:** Para dashboard executivo com KPIs principais.

---

### 5. 🎯 Fórmulas Únicas
**Tipo:** `metric-card`  
**Tamanho padrão:** 3×2 colunas  
**Descrição:** Quantidade de fórmulas distintas

**Funcionalidades:**
- Contagem de fórmulas únicas
- Valor médio por fórmula
- Design destacado com cor vermelha
- Integração com endpoint `/api/chartdata/stats`

**Quando usar:** Para monitorar variedade de produtos/fórmulas.

---

### 6. 📉 Tendência Temporal
**Tipo:** `line-chart`  
**Tamanho padrão:** 6×4 colunas  
**Descrição:** Evolução ao longo de 7, 30 ou 90 dias

**Funcionalidades:**
- Seletor de período: 7 dias / 30 dias / 90 dias
- Gráfico de barras por dia (DD/MM)
- Ordenação cronológica automática
- Filtro por data dos últimos X dias

**Quando usar:** Para identificar tendências, crescimento ou quedas ao longo do tempo.

**Exemplo de análise:**
- Identificar sazonalidade
- Detectar picos de produção
- Planejar capacidade futura

---

### 7. 📋 Tabela Detalhada
**Tipo:** `table`  
**Tamanho padrão:** 12×6 colunas  
**Descrição:** Lista completa com ordenação

**Funcionalidades:**
- **Ordenação por coluna:** Clique no cabeçalho para ordenar
  - Nome (alfabética)
  - Valor (numérica)
  - Dia (cronológica)
- **Indicadores visuais:** Setas ↑↓ mostram coluna e ordem de ordenação
- **Limite de 50 registros:** Top 50 baseado na ordenação
- **Hover highlighting:** Linha destacada ao passar o mouse
- Mostra Nome, Valor, Dia e Hora

**Quando usar:** Para auditoria, análise detalhada e busca de registros específicos.

---

### 8. 🔬 Análise Avançada
**Tipo:** `custom-analysis`  
**Tamanho padrão:** 8×5 colunas  
**Descrição:** Top 10, comparações e distribuições

**Funcionalidades:**

#### 🏆 Top 10 Fórmulas
- Lista as 10 fórmulas com maior volume
- Gráfico de barras horizontal
- Ordenado do maior para o menor

#### 📊 Análise por Horário
- Produção ao longo das horas do dia
- Identifica horários de pico
- Top 8 horários

#### 📈 Distribuição por Faixa
- Agrupa registros por faixas de valor:
  - 0-100kg
  - 100-500kg
  - 500-1000kg
  - >1000kg
- Útil para categorização de batches

**Quando usar:** Para análises exploratórias e descoberta de insights.

---

## 🎨 Sistema de Cores

```javascript
const COLORS = [
  "#ff2626ff", // Vermelho principal
  "#5e5e5eff", // Cinza escuro
  "#d4d4d4ff", // Cinza claro
  "#ffa8a8ff", // Rosa claro
  "#1b1b1bff"  // Preto
];
```

---

## 🔌 Endpoints do Backend

### Endpoints Especializados

1. **`GET /api/chartdata/formulas`**
   - Agrega por fórmula (Nome)
   - Retorna: chartData, total, totalRecords

2. **`GET /api/chartdata/produtos`**
   - Agrega por produto (Prod_1, Prod_2, etc.)
   - Retorna: chartData com unidades (g ou kg)

3. **`GET /api/chartdata/horarios`**
   - Agrega por horário (0h-23h)
   - Retorna: chartData, peakHour

4. **`GET /api/chartdata/diasSemana`**
   - Agrega por dia da semana
   - Retorna: chartData, peakDay

5. **`GET /api/chartdata/stats`**
   - Estatísticas gerais
   - Retorna: totalGeral, uniqueFormulas, uniqueDays, average

6. **`GET /api/chartdata/semana`** ⭐ NOVO
   - Dados de semana específica
   - Parâmetro obrigatório: `weekStart` (YYYY-MM-DD)
   - Retorna: chartData por dia da semana, weekTotal, peakDay

### Parâmetros de Filtro (Query Params)

Todos os endpoints aceitam:
- `formula` - Filtra por nome (LIKE)
- `dataInicio` - Data inicial
- `dataFim` - Data final
- `codigo` - Código específico
- `numero` - Número específico

**Exemplo:**
```
GET /api/chartdata/horarios?dataInicio=2025-01-01&dataFim=2025-01-31&codigo=ABC123
```

---

## 🎯 Como Adicionar Widgets

1. **Modo de Edição:**
   - Clique em "Editar Layout" no topo da página

2. **Adicionar Widget:**
   - Clique em "Adicionar Widget"
   - Selecione o tipo desejado
   - Widget é adicionado automaticamente no final

3. **Reorganizar:**
   - Arraste pelo ícone ⋮⋮ no canto superior esquerdo
   - Redimensione pelas bordas (se permitido)

4. **Remover:**
   - Clique no X no canto superior direito

5. **Salvar:**
   - Clique em "Salvar & Sair"
   - Layout é persistido no localStorage

---

## 💾 Persistência

- **Chave localStorage:** `dashboardWidgets` e `dashboardLayout`
- **Formato:** JSON
- **Escopo:** Por navegador/usuário
- **Reset:** Limpar localStorage ou recriar layout padrão

**Exemplo de estrutura salva:**
```json
{
  "dashboardWidgets": [
    {
      "id": "widget-donut-1",
      "type": "donut-chart",
      "title": "Análise de Dados",
      "chartType": "produtos",
      "config": {
        "filters": {
          "dataInicio": "2025-01-01",
          "dataFim": "2025-01-31"
        }
      }
    }
  ],
  "dashboardLayout": [
    { "i": "widget-donut-1", "x": 0, "y": 0, "w": 4, "h": 4 }
  ]
}
```

---

## 🚀 Performance

- **Lazy Loading:** Widgets só carregam dados quando visíveis
- **Debounce:** Filtros aplicam com 500ms de atraso
- **Memoização:** useMemo evita recalcular dados desnecessariamente
- **API optimizada:** Endpoints agregam no backend

---

## 📱 Responsividade

- Grid de 12 colunas
- Altura de linha: 80px
- Margem entre widgets: 12px
- Adaptação automática para telas menores

---

## 🎨 Customização

Para criar novos widgets, adicione em `WidgetContent.tsx`:

```typescript
if (type === "meu-widget") {
  return (
    <div className="h-full">
      {/* Seu conteúdo aqui */}
    </div>
  );
}
```

E registre em `DashboardBuilder.tsx`:

```typescript
{
  type: "meu-widget",
  label: "Meu Widget",
  icon: "🎉",
  description: "Descrição do widget",
  defaultSize: { w: 6, h: 4 }
}
```

---

**Última atualização:** 02/10/2025  
**Versão:** 2.0 - Sistema de Drag & Drop
