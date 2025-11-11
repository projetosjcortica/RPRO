---
applyTo: '**'
---


# Cortez – Análise Visual e Funcional Rigorosa para Interface e UX

## Aplicação: Interface do Sistema, Componentes React, Telas de Relatório

---

## Regras de Análise e Execução para o Projeto Cortez

### 1. Observação Estruturada de Interface
Antes de qualquer implementação ou modificação visual, analise hierarquicamente:
- **Geral**: Propósito da tela/componente, contexto no fluxo do usuário (ex: tela de login → dashboard → relatórios)
- **Específico**: Layout grid/flex, componentes UI (botões, tabelas, cards), esquema de cores corporativo
- **Micro-detalhes**: Espaçamentos (padding/margin), estados hover/active, responsividade, acessibilidade

### 2. Hierarquia de Detalhes Visuais
Toda descrição ou implementação deve seguir:

**Nível 1 – Estrutura de Página**:
- Qual componente React (`report.tsx`, `Dashboard.tsx`, etc.)
- Localização no `HashRouter`
- Responsabilidade da tela no fluxo de dados (leitura, escrita, controle)

**Nível 2 – Composição Visual**:
- Sistema de grid (quantas colunas, breakpoints)
- Paleta de cores utilizada (referência ao design system, se existir)
- Tipografia (tamanhos, pesos, hierarquia)

**Nível 3 – Elementos Atômicos**:
- Estados de interação (loading, error, success)
- Feedback visual (spinners, tooltips, notificações)
- Acessibilidade (contraste, aria-labels, navegação por teclado)

### 3. Linguagem Quantitativa Obrigatória
Use métricas precisas ao descrever ou implementar:
- **Espaçamentos**: `padding: 16px`, `gap: 1.5rem`, `margin-bottom: 24px`
- **Tamanhos**: `width: 100%`, `max-width: 1200px`, `height: 48px`
- **Cores**: Hexadecimal ou variável CSS (`#1E40AF`, `var(--primary-color)`)
- **Tipografia**: `font-size: 14px`, `font-weight: 600`, `line-height: 1.5`
- **Responsividade**: Breakpoints explícitos (`@media (max-width: 768px)`)

### 4. Verificação Cruzada Backend ↔ Frontend
Ao analisar ou implementar funcionalidades visuais que dependem de dados:
- Confirme o endpoint usado (`/api/relatorio/paginate`, `/api/collector/status`)
- Valide o formato de resposta (estrutura JSON esperada)
- Verifique tratamento de estados (loading, empty, error)
- Assegure consistência de datas (`formatShortDate`), labels dinâmicas (`/api/materiaprima/labels`)

### 5. Formato de Saída Obrigatório para Análise de Telas

````markdown
# Relatório de Análise Visual – [Nome da Tela/Componente]

## 1. Visão Geral e Contexto
- **Componente React**: `src/[caminho].tsx`
- **Rota**: `/[rota-hash-router]`
- **Função no Sistema**: [Leitura de relatórios | Controle de collector | Dashboard executivo]
- **Formato/Proporção**: [Desktop-first | Mobile-first | Responsivo]

## 2. Composição Visual e Layout
- **Sistema de Grid**: [CSS Grid 12 colunas | Flexbox em linha | Stack vertical]
- **Paleta de Cores**:
  - Primária: `#[HEX]`
  - Secundária: `#[HEX]`
  - Feedback (success/error/warning): `#[HEX]` / `#[HEX]` / `#[HEX]`
- **Tipografia**:
  - Títulos: `[tamanho]px`, peso `[valor]`
  - Corpo: `[tamanho]px`, peso `[valor]`
  - Espaçamento entre linhas: `[valor]`

## 3. Detalhes de Iluminação e Interação
- **Estados de Componentes**:
  - Hover: [descrição do efeito]
  - Active/Focus: [descrição do efeito]
  - Disabled: [opacidade, cursor]
- **Feedback Visual**:
  - Loading: [spinner | skeleton | barra de progresso]
  - Erro: [toast | banner | inline]
  - Sucesso: [notificação | mudança de cor]

## 4. Análise de Elementos (Micro-detalhes)

### 4.1. Elemento A – [Ex: Tabela de Relatórios]
- **Localização**: [1/3 superior da tela | Centro | Sidebar direita]
- **Dimensões**: `width: [valor]`, `height: [valor]`
- **Espaçamento interno**: `padding: [valor]`
- **Colunas dinâmicas**: Mapeadas via `/api/materiaprima/labels`, renderizadas como `col{index}`
- **Paginação**: Controlada por `useReportData`, 50 linhas/página

### 4.2. Elemento B – [Ex: Cards de Status do Collector]
- **Localização**: [Topo da tela | Grid 3 colunas]
- **Cor de fundo**: `#[HEX]` para estado idle, `#[HEX]` para syncing
- **Ícone**: [Descrição do ícone SVG, tamanho, cor]
- **Polling**: Atualização a cada 10s via `/api/collector/status`

### 4.3. Fundo/Contexto
- **Background**: [Cor sólida | Gradiente | Textura]
- **Contraste com texto**: Razão mínima de 4.5:1 (WCAG AA)
- **Efeitos**: [Sombra | Border-radius | Blur]

## 5. Pontos de Ambiguidade/Inconsistência
- [Listar qualquer elemento sem especificação clara, ex: "Cor do botão secundário não definida no design system"]
- [Comportamento em edge cases, ex: "Sem tratamento visual para tabela vazia"]
- [Responsividade não testada abaixo de 768px]

## 6. Checklist de Implementação
- [ ] Componente criado/modificado em `src/[caminho].tsx`
- [ ] Endpoint backend validado e documentado
- [ ] Estados de loading/error/empty implementados
- [ ] Responsividade testada (mobile, tablet, desktop)
- [ ] Acessibilidade verificada (contraste, navegação por teclado)
- [ ] Integração com `Processador.ts` para chamadas backend
- [ ] Formato de datas normalizado com `formatShortDate`
- [ ] Build testado: `npm run build` sem erros TypeScript
````

---

## Aplicação Prática no Cortez

### Ao analisar/modificar uma tela de relatório:
1. Identifique o componente (`src/report.tsx`)
2. Mapeie o fluxo de dados (endpoint → `useReportData` → renderização)
3. Descreva cada elemento visual com métricas precisas
4. Valide estados de erro/loading/empty
5. Documente breakpoints de responsividade

### Ao criar novos componentes UI:
1. Defina dimensões e espaçamentos em rem/px
2. Use paleta de cores consistente (variáveis CSS se disponíveis)
3. Implemente estados hover/active/disabled
4. Adicione feedback visual para ações assíncronas
5. Teste em múltiplos tamanhos de tela

### Ao integrar backend ↔ frontend:
1. Documente o endpoint no formato `/api/[recurso]/[ação]`
2. Especifique o shape da resposta JSON
3. Implemente tratamento de erro com UI clara
4. Normalize formatos de data via `formatShortDate`
5. Use helpers do `Processador.ts` em vez de `fetch` direto

---

## Execução: Imediata, Formal, Sem Alternativas

**Quando solicitado para implementar ou analisar**:
- Execute a análise completa seguindo o modelo acima
- Forneça código TypeScript/React pronto para uso
- Não ofereça múltiplas opções — escolha a mais otimizada
- Mantenha formalidade e objetividade
- Priorize performance e acessibilidade

**Cortez. A inteligência por trás do seu controle.**