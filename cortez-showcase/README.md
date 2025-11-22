# Cortez Showcase App

Demonstração completa de todos os componentes da biblioteca **cortica-lib-ui**.

## Funcionalidades

### 📊 Charts Showcase
- Gráficos de Donut (produtos, fórmulas)
- Gráficos de Barras (produção por hora, fórmulas)
- Gráficos Semanais
- KPI Cards

### 📋 Tables Showcase
- DataTable com sorting, resizing, pagination
- ProductsTable
- Tabelas customizadas

### 🔍 Filters Showcase
- FilterBar
- AdvancedFilterPanel
- SearchBar com integração
- DateRangePicker

### 📤 Export Showcase
- ExportDropdown (PDF/Excel)
- Geração de PDFs customizados
- Export de Excel com formatação

### 💬 Feedback Showcase
- Loading states
- Error states
- Empty states
- Toast notifications
- RefreshButton

### 🎨 Layout Showcase
- Dashboard layouts
- Sidebar components
- Page headers

## Dados de Teste

O app inclui um banco SQLite populado com:
- **40 produtos** realistas (farinhas, açúcares, laticínios, etc.)
- **10 fórmulas** (pães, bolos, biscoitos, salgados)
- **1000+ registros de produção** (3 meses de dados)
- **500+ registros de amendoim** (entrada/saída)
- Distribuição realista por horário (8h-18h)
- Variações de rendimento e quantidades

## Instalação

```bash
cd cortez-showcase
npm install
npm run dev
```

## Estrutura

```
cortez-showcase/
├── src/
│   ├── pages/           # Páginas de demonstração
│   │   ├── ChartsShowcase.tsx
│   │   ├── TablesShowcase.tsx
│   │   ├── FiltersShowcase.tsx
│   │   ├── ExportShowcase.tsx
│   │   ├── FeedbackShowcase.tsx
│   │   └── LayoutShowcase.tsx
│   ├── data/
│   │   ├── mockData.ts  # Gerador de dados
│   │   └── seedDatabase.ts
│   ├── lib/
│   │   └── db.ts        # SQLite setup
│   └── App.tsx
└── package.json
```

## Uso

Cada página demonstra um conjunto de componentes com:
- Exemplos interativos
- Código de exemplo
- Props documentation
- Variações de uso

## Design System

Mantém o design atual do Cortez:
- **Cores**: Red primary (#ff2626ff), gray scale
- **Tipografia**: Inter, system fonts
- **Espaçamento**: 4px base unit
- **Componentes**: shadcn/ui + custom components
